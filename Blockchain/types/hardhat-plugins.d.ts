import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: any;
  }
}
