// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MaintenaProofRegistry {
    address public immutable authorisedSigner;
    mapping(bytes32 => bool) public proofExists;
    enum RecordType { Installation, Service, Inspection, WarrantyClaimStatus }
    event ProofAnchored(bytes32 indexed proofId, bytes32 indexed assetReferenceHash, bytes32 indexed recordReferenceHash, bytes32 recordContentHash, RecordType recordType, bytes32 previousRecordHash, uint256 timestamp);
    constructor(address signer) { authorisedSigner = signer; }
    function anchorProof(bytes32 proofId, bytes32 assetReferenceHash, bytes32 recordReferenceHash, bytes32 recordContentHash, RecordType recordType, bytes32 previousRecordHash) external {
        require(msg.sender == authorisedSigner, "not authorised");
        require(!proofExists[proofId], "proof already exists");
        proofExists[proofId] = true;
        emit ProofAnchored(proofId, assetReferenceHash, recordReferenceHash, recordContentHash, recordType, previousRecordHash, block.timestamp);
    }
}