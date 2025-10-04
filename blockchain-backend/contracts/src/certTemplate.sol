// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/access/AccessControl.sol";
import {CertAgency} from "./CertAgency.sol";

contract CertTemplate is AccessControl {
    struct Template {
        uint256 id; // unique template ID
        string name; // e.g. "Electrician Level 1"
        string description; // optional narrative / NSQF level etc.
        uint256 creatorInstituteId; // which institute created this
        bool active;
    }

    mapping(uint256 => Template) public templates;
    uint256 private _nextTemplateId = 1;

    CertAgency public certAgency;

    event TemplateCreated(uint256 indexed id, string name, uint256 instituteId);
    event TemplateDeactivated(uint256 indexed id);

    constructor(address certAgencyAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // NCVET root admin
        certAgency = CertAgency(certAgencyAddress);
    }

    /// Create new qualification template (only approved institutes)
    function createTemplate(string calldata name, string calldata description) external returns (uint256) {
        require(certAgency.isApprovedInstitute(msg.sender), "Not an approved institute");

        uint256 instituteId = certAgency.walletToInstituteId(msg.sender);
        uint256 templateId = _nextTemplateId++;

        templates[templateId] = Template({
            id: templateId,
            name: name,
            description: description,
            creatorInstituteId: instituteId,
            active: true
        });

        emit TemplateCreated(templateId, name, instituteId);
        return templateId;
    }

    /// Deactivate a template (only NCVET or the creating institute)
    function deactivateTemplate(uint256 templateId) external {
        Template storage template = templates[templateId];
        require(template.active, "Already inactive");

        // Only NCVET or creator institute can deactivate
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
                || certAgency.walletToInstituteId(msg.sender) == template.creatorInstituteId,
            "Not authorized"
        );

        template.active = false;
        emit TemplateDeactivated(templateId);
    }

    /// Check if a template is active
    function isActiveTemplate(uint256 templateId) public view returns (bool) {
        return templates[templateId].active;
    }
}
