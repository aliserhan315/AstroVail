// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// One star == one ERC-721. tokenId = uint256(keccak256(bytes(catalogId))).
/// Transfers disabled unless caller has TRANSFER_ROLE (soulbound-like).
contract StarOwnership is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    constructor(address admin) ERC721("AstroVail Star", "STAR") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mintStar(address to, uint256 tokenId, string calldata uri)
        external
        onlyRole(MINTER_ROLE)
    {
        require(!_exists(tokenId), "Star claimed");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Block transfers unless caller has TRANSFER_ROLE (mint/burn allowed).
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            require(hasRole(TRANSFER_ROLE, auth), "Transfers disabled");
        }
        return super._update(to, tokenId, auth);
    }
}

