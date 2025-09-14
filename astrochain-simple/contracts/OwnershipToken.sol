// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Simple ERC-721 for ownership tracking.
 * Admin (owner) can mint to users. Normal ERC-721 transfers are allowed.
 */
contract OwnershipToken is ERC721, Ownable {
    uint256 public currentTokenId;

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {}

    function mint(address to) external onlyOwner returns (uint256) {
        require(to != address(0), "invalid to");
        currentTokenId += 1;
        uint256 tokenId = currentTokenId;
        _safeMint(to, tokenId);
        return tokenId;
    }
}

