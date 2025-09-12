import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StarModule", (m: any) => {
  const admin = m.getParameter("admin");
  const star = m.contract("StarOwnership", [admin]);
  return { star };
});
