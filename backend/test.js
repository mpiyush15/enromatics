import bcrypt from "bcryptjs";

const runTest = async () => {
  const password = "Pm@22442232";
  const hash = "$2b$10$cpp5e8x0lYpOm21TDqL23OsZ6f/xeMqGEMq9rtHSdmN26g./YhG/e";

  const isMatch = await bcrypt.compare(password, hash);
  console.log("Password match:", isMatch);
};

runTest();
