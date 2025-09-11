// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title AstroVail Star Ownership (ERC-721)
/// @notice Deterministic tokenIds are computed off-chain as uint256(keccak256(bytes(catalogId))).
///         Transfers are disabled unless caller has TRANSFER_ROLE (soulbound-like).
contract StarOwnership is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    constructor(address admin) ERC721("AstroVail Star", "STAR") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /// @dev tokenId must be keccak256(catalogId) provided by backend; metadata URI should be IPFS/HTTPS.
    function mintStar(address to, uint256 tokenId, string calldata tokenURI_) external onlyRole(MINTER_ROLE) {
        require(_ownerOf(tokenId) == address(0), "Star already claimed");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
    }

    /// @dev Disable transfers unless caller has TRANSFER_ROLE. Mints/burns still allowed.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        bool isMintOrBurn = (from == address(0) || to == address(0));
        if (!isMintOrBurn) {
            require(hasRole(TRANSFER_ROLE, auth), "Transfers disabled");
        }
        return super._update(to, tokenId, auth);
    }
}

