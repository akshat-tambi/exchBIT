import { staticImages } from "../utils/images";

const navMenuData = [
  {
    id: "nav-menu-1",
    menuLink: "/userProduct",
    menuText: "Your Ads",
  },
  {
    id: "nav-menu-2",
    menuLink: "/sign_in",
    menuText: "Sign In",
  },
  {
    id: "nav-menu-4",
    menuLink: "/chats",
    menuText: "Chats",
  },
];

const sideMenuData = [
  {
    id: "side-menu-1",
    menuLink: "/userProduct",
    menuText: "Your Ads",
    iconName: "house",
  },
  {
    id: "side-menu-2",
    menuLink: "/NewProduct",
    menuText: "Create New Ad",
    iconName: "grid-fill",
  },
  {
    id: "side-menu-3",
    menuLink: "/wishlist",
    menuText: "Wishlist",
    iconName: "heart",
  },
  {
    id: "nav-menu-4",
    menuLink: "/chats",
    menuText: "Chats",
    iconName: "chat"
  },
  // {
  //   id: "side-menu-5",
  //   menuLink: "/cart",
  //   menuText: "Cart",
  //   iconName: "bag-check-fill",
  // },
];


const CategoriesData = [
  {
    id: "saving-z-1",
    imgSource: staticImages.electronics,
    title: "Electronics",
    description: "All the electrical stuff",
  },
  {
    id: "saving-z-2",
    imgSource: staticImages.fashion,
    title: "Fashion",
    description: "All about fashion",
  },
  {
    id: "saving-z-3",
    imgSource: staticImages.scholastic,
    title: "Scholastic Gear",
    description: "All the necessary items",
  },
  {
    id: "saving-z-4",
    imgSource: staticImages.labCoat,
    title: "Lab Apparel",
    description: "Lab uniforms",
  },
  {
    id: "saving-z-5",
    imgSource: staticImages.general,
    title: "Miscellaneous Items",
    description: "General esentials",
  },
];


const socialLinksData = [
  {
    id: "social_link_1",
    site_name: "facebook",
    site_icon: "bi bi-facebook",
    site_url: "www.facbook.com",
  },
  {
    id: "social_link_2",
    site_name: "instagram",
    site_icon: "bi bi-instagram",
    site_url: "www.instagram.com",
  },
  {
    id: "social_link_3",
    site_name: "twitter",
    site_icon: "bi bi-twitter",
    site_url: "www.twitter.com",
  },
  {
    id: "social_link_4",
    site_name: "linkedin",
    site_icon: "bi bi-linkedin",
    site_url: "www.linkedin.com",
  },
];

export {
  sideMenuData,
  navMenuData,
  CategoriesData,
  socialLinksData,
};
