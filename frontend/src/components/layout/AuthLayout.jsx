import { PageWrapper } from "../../styles/styles";
import AuthHeader from "../header/AuthHeader";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <PageWrapper>
      <AuthHeader />
      <main>
        <Outlet />
      </main>
    </PageWrapper>
  );
};

export default AuthLayout;
