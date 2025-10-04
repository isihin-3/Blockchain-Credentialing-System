// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/access/AccessControl.sol";
import {CertAgency} from "./CertAgency.sol";

contract Receiver is AccessControl {
    struct Learner {
        uint256 id;
        address wallet; // learner wallet
        bytes32 identityHash; // keccak256(Aadhaar or StudentID)
        uint256 registeredBy; // instituteId that registered this learner
        bool active;
    }

    mapping(uint256 => Learner) public learners;
    mapping(address => uint256) public walletToLearnerId;
    mapping(bytes32 => uint256) public identityHashToLearnerId;

    uint256 private _nextLearnerId = 1;

    CertAgency public certAgency;

    event LearnerRegistered(uint256 indexed id, address wallet, bytes32 identityHash, uint256 instituteId);
    event LearnerDeactivated(uint256 indexed id);

    constructor(address certAgencyAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // NCVET root admin
        certAgency = CertAgency(certAgencyAddress);
    }

    /// Register a learner (only by approved institutes)
    function registerLearner(address wallet, bytes32 identityHash) external returns (uint256) {
        require(wallet != address(0), "Invalid wallet");
        require(certAgency.isApprovedInstitute(msg.sender), "Not an approved institute");
        require(walletToLearnerId[wallet] == 0, "Wallet already registered");
        require(identityHashToLearnerId[identityHash] == 0, "Identity already registered");

        uint256 learnerId = _nextLearnerId++;
        uint256 instituteId = certAgency.walletToInstituteId(msg.sender);

        learners[learnerId] = Learner({
            id: learnerId,
            wallet: wallet,
            identityHash: identityHash,
            registeredBy: instituteId,
            active: true
        });

        walletToLearnerId[wallet] = learnerId;
        identityHashToLearnerId[identityHash] = learnerId;

        emit LearnerRegistered(learnerId, wallet, identityHash, instituteId);
        return learnerId;
    }

    /// Deactivate a learner (only NCVET or registering institute)
    function deactivateLearner(uint256 learnerId) external {
        Learner storage learner = learners[learnerId];
        require(learner.active, "Learner already inactive");

        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
                || certAgency.walletToInstituteId(msg.sender) == learner.registeredBy,
            "Not authorized"
        );

        learner.active = false;
        emit LearnerDeactivated(learnerId);
    }

    /// Check if learner is active by wallet
    function isActiveLearner(address wallet) public view returns (bool) {
        uint256 learnerId = walletToLearnerId[wallet];
        return (learnerId != 0 && learners[learnerId].active);
    }

    /// Check if learner is active by identity hash
    function isActiveLearnerByHash(bytes32 identityHash) public view returns (bool) {
        uint256 learnerId = identityHashToLearnerId[identityHash];
        return (learnerId != 0 && learners[learnerId].active);
    }

    function getLearnerWallet(uint256 learnerId) external view returns (address) {
        return learners[learnerId].wallet;
    }
}
