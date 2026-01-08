// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) public assetMetadata; // ipfs hash or JSON

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {}

    function mintAsset(address to, string calldata metadataURI) external onlyOwner returns (uint256) {
        uint256 tid = ++nextTokenId;
        _safeMint(to, tid);
        assetMetadata[tid] = metadataURI;
        return tid;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "not exist");
        return assetMetadata[tokenId];
    }
}
