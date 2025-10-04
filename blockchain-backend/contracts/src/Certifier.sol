// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/access/AccessControl.sol";
import {CertAgency} from "./CertAgency.sol";

contract Certifier is AccessControl {
    struct Staff {
        uint256 id;
        string name;
        address wallet; // Staff wallet address
        uint256 instituteId; // Link to Institute in CertAgency
        bool active;
    }

    mapping(uint256 => Staff) public staffMembers;
    mapping(address => uint256) public walletToStaffId;

    uint256 private _nextStaffId = 1;

    event StaffAdded(uint256 indexed id, string name, address wallet, uint256 instituteId);
    event StaffRevoked(uint256 indexed id, string name, address wallet);

    CertAgency public certAgency;

    constructor(address certAgencyAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // NCVET super-admin
        certAgency = CertAgency(certAgencyAddress); // Reference to CertAgency
    }

    /// Add new staff (can only be called by an approved institute wallet)
    function addStaff(string calldata name, address wallet) external returns (uint256) {
        require(wallet != address(0), "Invalid wallet");
        require(walletToStaffId[wallet] == 0, "Wallet already registered");

        // Check msg.sender is an approved Institute from CertAgency
        require(certAgency.isApprovedInstitute(msg.sender), "Not an approved institute");

        uint256 staffId = _nextStaffId++;
        uint256 instituteId = certAgency.walletToInstituteId(msg.sender);

        staffMembers[staffId] = Staff(staffId, name, wallet, instituteId, true);
        walletToStaffId[wallet] = staffId;

        emit StaffAdded(staffId, name, wallet, instituteId);
        return staffId;
    }

    /// Revoke staff (only by NCVET admin or by their own institute)
    function revokeStaff(uint256 staffId) external {
        Staff storage staff = staffMembers[staffId];
        require(staff.active, "Staff not active");

        // NCVET admin can revoke, OR the parent institute of the staff
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || certAgency.walletToInstituteId(msg.sender) == staff.instituteId,
            "Not authorized"
        );

        staff.active = false;
        emit StaffRevoked(staffId, staff.name, staff.wallet);
    }

    /// Check if a wallet is an active staff member
    function isApprovedStaff(address wallet) public view returns (bool) {
        uint256 staffId = walletToStaffId[wallet];
        return (staffId != 0 && staffMembers[staffId].active);
    }

    /// Get institute of a staff wallet
    function getStaffInstitute(address wallet) public view returns (uint256) {
        uint256 staffId = walletToStaffId[wallet];
        require(staffId != 0, "Staff not found");
        return staffMembers[staffId].instituteId;
    }
}
