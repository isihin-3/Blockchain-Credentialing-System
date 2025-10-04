# 🎓 Ordinals: Decentralized Skill Credentials

A fully decentralized credentialing platform built on an Ethereum-compatible blockchain. Ordinals is our solution designed to bring absolute trust, transparency, and security to India's vocational education ecosystem.

## 🌟 Overview

Ordinals replaces traditional, forgeable certificates with a **single, immutable source of truth** on the blockchain. Our sophisticated **5-contract architecture**, inspired by academic research, creates a fully self-contained system. It enables NCVET and accredited institutions to issue, manage, and verify skill certificates with mathematical certainty, while integrating seamlessly with national platforms like  

**DigiLocker**.

### Key Benefits

*   **🔒 Zero Forgery:** Certificates are immutable blockchain records, making them impossible to forge.  
    
*   **🌐 Instant Verification:** Employers can verify credentials in seconds via a QR code, as shown in our verification flowchart.  
    
*   **🔐 Privacy by Design:** We only store a **cryptographic hash** of a learner's sensitive ID on-chain, ensuring privacy.  
    
*   **🎯 On-Chain Governance:** A secure, role-based "chain of trust" for NCVET and institutions is enforced by smart contracts.  
    
*   **📈 Scalable & Cost-Efficient:** Our normalized data model drastically **reduces gas fees**, making the system viable at a national scale.  
    

## 🏗️ Architecture

*   **Frontend (DApp):** React, Ethers.js, Tailwind CSS
    
*   **Wallet:** MetaMask for authentication and transaction signing.
    
*   **Backend (Fully On-Chain):** 5 interconnected Solidity smart contracts deployed on an Ethereum-compatible blockchain (ideally a Layer 2).
    

## 🔗 Smart Contracts: The 5-Contract Architecture

Our system's core is its relational on-chain data model, separating concerns into five specialized contracts for security and efficiency.  

| Contract | Purpose in Our Solution |
| --- | --- |
| CertAgency | On-chain registry of NCVET-accredited Institutes. |
| Certifier | Manages authorized staff (Issuers) within each institute. |
| CertTemplate | A library of NCVET-approved qualifications to save costs. |
| Receiver | A privacy-focused registry of learners using ID hashes. |
| Certificates | Issues the final, lightweight credential that immutably links all other records. |


## 🚀 Features

### 🔐 Wallet-Based Role Management

*   **Secure Login:** Users connect their MetaMask wallet to authenticate.
    
*   **Automatic Role Detection:** The DApp checks the user's wallet against the smart contracts to assign their role (**NCVET Admin, Institute, Issuer, or Learner**).
    

### 📜 Certificate Issuance

*   **Streamlined UI:** An intuitive form for authorized Issuers to enter all certificate details, as shown in our UI mockup.
    
*   **Privacy-Preserving Hashing:** The DApp automatically hashes the Learner's ID and any uploaded marksheet files before sending the transaction.
    
*   **Preview Before Issuing:** A "Preview Certificate" feature opens a new tab showing exactly how the final, verified certificate will look.
    

### 🔍 Instant Verification

*   **QR Code & Manual Entry:** Employers can verify by scanning a QR code or entering a unique Certificate ID.
    
*   **"Chain of Trust" Check:** The DApp performs a free, read-only call to the smart contracts to verify the entire chain of authority—from NCVET down to the issuer.
    

## 🛠️ Installation & Setup

### Prerequisites

*   Node.js 18+
    
*   MetaMask wallet browser extension
    

### Installation

1.  **Clone the repository**
    
    Bash
    
        https://github.com/iamnikhilranjan/Blockchain-Credentialing-System.git
        cd Blockchain-Credentialing-System
    
2.  **Install dependencies**
    
    Bash
    
        npm install
    
3.  **Configure environment**
    
    *   Create a `.env` file and add your Ethereum RPC URL and the deployed smart contract addresses.
        
4.  **Start the development server**
    
    Bash
    
        npm run dev