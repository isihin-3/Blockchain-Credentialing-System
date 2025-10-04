// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {CertAgency} from "../src/CertAgency.sol";
import {Certifier} from "../src/Certifier.sol";
import {CertTemplate} from "../src/CertTemplate.sol";
import {Receiver} from "../src/Receiver.sol";
import {Certificates} from "../src/Certificate.sol";

contract Deploy is Script {
    function run() external {
        // Load deployer’s private key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy CertAgency
        CertAgency certAgency = new CertAgency();

        // 2. Deploy Certifier (needs CertAgency)
        Certifier certifier = new Certifier(address(certAgency));

        // 3. Deploy CertTemplate (needs Certifier)
        CertTemplate certTemplate = new CertTemplate(address(certAgency));

        // 4. Deploy Receiver (needs Certifier)
        Receiver receiver = new Receiver(address(certAgency));

        // 5. Deploy Certificates (needs Template + Receiver + Certifier)
        Certificates certificates =
            new Certificates(address(certAgency), address(certifier), address(certTemplate), address(receiver));

        vm.stopBroadcast();

        // Logs
        console2.log("Contracts deployed:");
        console2.log("CertAgency: ", address(certAgency));
        console2.log("Certifier: ", address(certifier));
        console2.log("CertTemplate: ", address(certTemplate));
        console2.log("Receiver: ", address(receiver));
        console2.log("Certificates: ", address(certificates));
    }
}
