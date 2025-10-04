// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/access/AccessControl.sol";

import {CertAgency} from "./CertAgency.sol";
import {Certifier} from "./Certifier.sol";
import {CertTemplate} from "./CertTemplate.sol";
import {Receiver} from "./Receiver.sol";

contract Certificates is ERC721, AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    struct CertificateData {
        bytes32 idHash;
        uint256 learnerId; // from Receiver
        uint256 templateId; // from CertTemplate
        uint256 staffId; // from Certifier
        uint256 instituteId; // from CertAgency
        uint256 issuedAt;
        uint256 validUntil;
        bool revoked;
        bytes32 dataHash; // cryptographic proof
    }

    mapping(uint256 => CertificateData) public certificates;
    uint256 private _nextCertId = 1;

    // External contract references
    CertAgency public certAgency;
    Certifier public certifier;
    CertTemplate public certTemplate;
    Receiver public receiver;

    event CertificateIssued(
        uint256 indexed certId, uint256 learnerId, uint256 templateId, uint256 staffId, uint256 instituteId
    );

    event CertificateRevoked(uint256 indexed certId);

    constructor(address certAgencyAddr, address certifierAddr, address certTemplateAddr, address receiverAddr)
        ERC721("VocationalCertificate", "VCERT")
    {
        _grantRole(ADMIN_ROLE, msg.sender);
        certAgency = CertAgency(certAgencyAddr);
        certifier = Certifier(certifierAddr);
        certTemplate = CertTemplate(certTemplateAddr);
        receiver = Receiver(receiverAddr);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// Issue a new certificate (only staff approved in Certifier)
    function issueCertificate(uint256 learnerId, uint256 templateId, uint256 validUntil, bytes32 dataHash)
        external
        returns (uint256)
    {
        // Verify staff
        require(certifier.isApprovedStaff(msg.sender), "Not authorized staff");
        uint256 staffId = certifier.walletToStaffId(msg.sender);
        uint256 instituteId = certifier.getStaffInstitute(msg.sender);

        // Verify learner is active
        (,, bytes32 storedIdHash,, bool active) = receiver.learners(learnerId);
        require(active, "Invalid learner");

        // Verify template is active
        require(certTemplate.isActiveTemplate(templateId), "Invalid template");

        uint256 certId = _nextCertId++;
        certificates[certId] = CertificateData({
            idHash: storedIdHash,
            learnerId: learnerId,
            templateId: templateId,
            staffId: staffId,
            instituteId: instituteId,
            issuedAt: block.timestamp,
            validUntil: validUntil,
            revoked: false,
            dataHash: dataHash
        });

        // Mint soulbound NFT to learner wallet
        address learnerWallet = receiver.getLearnerWallet(learnerId);
        _safeMint(learnerWallet, certId);

        emit CertificateIssued(certId, learnerId, templateId, staffId, instituteId);
        return certId;
    }

    /// Revoke a certificate (only NCVET admin or issuing staff’s institute)
    function revokeCertificate(uint256 certId) external {
        CertificateData storage cert = certificates[certId];
        require(!cert.revoked, "Already revoked");

        // Authorization: NCVET or staff’s parent institute
        require(
            hasRole(ADMIN_ROLE, msg.sender) || certifier.getStaffInstitute(msg.sender) == cert.instituteId,
            "Not authorized"
        );

        cert.revoked = true;
        emit CertificateRevoked(certId);
    }

    function verifyCertificate(uint256 certId, bytes32 providedIdHash, bytes32 providedDetailsHash)
        external
        view
        returns (bool valid)
    {
        CertificateData memory cert = certificates[certId];
        if (cert.issuedAt == 0) return false;

        bool idMatches = (cert.idHash == providedIdHash);
        bool detailsMatch = (cert.dataHash == providedDetailsHash);
        bool stillValid = !cert.revoked && (cert.validUntil == 0 || cert.validUntil > block.timestamp);

        return (idMatches && detailsMatch && stillValid);
    }

    /// Soulbound restriction: disable transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) {
            revert("Soulbound: transfers disabled");
        }
        return super._update(to, tokenId, auth);
    }
}
