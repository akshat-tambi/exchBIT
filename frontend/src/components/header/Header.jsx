import styled from "styled-components";
import { HeaderMainWrapper, SiteBrandWrapper } from "../../styles/header";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import { navMenuData } from "../../data/data";
import { Link, useLocation } from "react-router-dom";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../../redux/slices/sidebarSlice";
import { useState } from "react";

const NavigationAndSearchWrapper = styled.div`
  column-gap: 20px;
  .search-form {
    @media (max-width: ${breakpoints.lg}) {
      width: 100%;
      max-width: 500px;
    }
    @media (max-width: ${breakpoints.sm}) {
      display: none;
    }
  }

  .input-group {
    min-width: 320px;

    .input-control {
      @media (max-width: ${breakpoints.sm}) {
        display: none;
      }
    }

    @media (max-width: ${breakpoints.xl}) {
      min-width: 160px;
    }

    @media (max-width: ${breakpoints.sm}) {
      min-width: auto;
      grid-template-columns: 100%;
    }
  }

  @media (max-width: ${breakpoints.lg}) {
    width: 100%;
    justify-content: flex-end;
  }

  .menu-toggler {
    display: none;
    font-size: 24px;
    font-weight: bold;
    background: none;
    border: none;
    cursor: pointer;

    @media (max-width: ${breakpoints.lg}) {
      display: inline-block;
    }
  }
`;

const NavigationMenuWrapper = styled.nav`
  .nav-menu-list {
    margin-left: 20px;
    display: flex;

    @media (max-width: ${breakpoints.lg}) {
      flex-direction: column;
      position: absolute;
      top: 60px; /* adjust based on your header height */
      right: 0;
      width: 100%;
      background: ${defaultTheme.color_white};
      z-index: 999;
      display: ${(props) => (props.isMenuOpen ? "flex" : "none")};
    }
  }

  .nav-menu-item {
    margin-right: 20px;
    margin-left: 20px;

    @media (max-width: ${breakpoints.xl}) {
      margin-left: 16px;
      margin-right: 16px;
    }
  }

  .nav-menu-link {
    &.active {
      color: ${defaultTheme.color_outerspace};
      font-weight: 700;
    }

    &:hover {
      color: ${defaultTheme.color_outerspace};
    }
  }
`;

const IconLinksWrapper = styled.div`
  column-gap: 18px;
  .icon-link {
    width: 36px;
    height: 36px;
    border-radius: 6px;

    &.active {
      background-color: ${defaultTheme.color_sea_green};
      img {
        filter: brightness(100);
      }
    }

    &:hover {
      background-color: ${defaultTheme.color_whitesmoke};
    }
  }

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 8px;
  }

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 6px;
  }
`;

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <HeaderMainWrapper className="header flex items-center">
      <Container className="container">
        <div className="header-wrap flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="sidebar-toggler"
              onClick={() => dispatch(toggleSidebar())}
            >
              <i className="bi bi-list"></i>
            </button>
            <SiteBrandWrapper to="/" className="inline-flex">
              <div className="brand-img-wrap flex items-center justify-center">
                <img
                  className="site-brand-img"
                  src={staticImages.logo}
                  alt="site logo"
                />
              </div>
              <span className="site-brand-text text-outerspace">exchBIT</span>
            </SiteBrandWrapper>
          </div>
          <NavigationAndSearchWrapper className="flex items-center">
            <NavigationMenuWrapper isMenuOpen={isMenuOpen}>
              <ul className="nav-menu-list flex items-center">
                {navMenuData?.map((menu) => (
                  <li className="nav-menu-item" key={menu.id}>
                    <Link
                      to={menu.menuLink}
                      className={`nav-menu-link text-base font-medium text-gray ${
                        location.pathname === menu.menuLink ? "active" : ""
                      }`}
                    >
                      {menu.menuText}
                    </Link>
                  </li>
                ))}
              </ul>
            </NavigationMenuWrapper>
            <button
              type="button"
              className="menu-toggler"
              onClick={toggleMenu}
            >
              &#x22EE;
            </button>
          </NavigationAndSearchWrapper>

          <IconLinksWrapper className="flex items-center">
            <Link
              to="/wishlist"
              className={`icon-link ${
                location.pathname === "/wishlist" ? "active" : ""
              } inline-flex items-center justify-center`}
            >
              <img src={staticImages.heart} alt="" />
            </Link>
            <Link
              to="/NewProduct"
              className={`icon-link inline-flex items-center justify-center`}
            >
              <img src={staticImages.user} alt="" />
            </Link>
          </IconLinksWrapper>
        </div>
      </Container>
    </HeaderMainWrapper>
  );
};

export default Header;
