import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI ,
  jwtSecret: process.env.JWT_SECRET,
  chainRpcUrl: process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8546',
  ownershipContract: process.env.OWNERSHIP_CONTRACT_ADDRESS || '',
  chainOwnerPrivateKey: process.env.CHAIN_OWNER_PRIVATE_KEY || '',
};
