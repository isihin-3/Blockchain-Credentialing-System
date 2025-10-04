// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/access/AccessControl.sol";

contract CertAgency is AccessControl {
    struct Institute {
        uint256 id;
        string name;
        address wallet; // institute’s authorized wallet
        bool active;
    }

    mapping(uint256 => Institute) public institutes;
    mapping(address => uint256) public walletToInstituteId;

    uint256 private _nextInstituteId = 1;

    event InstituteAdded(uint256 indexed id, string name, address wallet);
    event InstituteRevoked(uint256 indexed id, string name, address wallet);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // NCVET deployer is the admin
    }

    /// Add a new institute (only NCVET admin)
    function addInstitute(string calldata name, address wallet)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (uint256)
    {
        require(wallet != address(0), "Invalid wallet address");
        require(walletToInstituteId[wallet] == 0, "Wallet already registered");

        uint256 id = _nextInstituteId++;
        institutes[id] = Institute(id, name, wallet, true);
        walletToInstituteId[wallet] = id;

        emit InstituteAdded(id, name, wallet);
        return id;
    }

    /// Revoke an existing institute
    function revokeInstitute(uint256 id) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(institutes[id].active, "Institute not active");
        institutes[id].active = false;

        emit InstituteRevoked(id, institutes[id].name, institutes[id].wallet);
    }

    /// Check if an address is an approved institute
    function isApprovedInstitute(address wallet) public view returns (bool) {
        uint256 id = walletToInstituteId[wallet];
        return (id != 0 && institutes[id].active);
    }
}
