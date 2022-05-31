import React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { Link, useLocation } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import Badge from "@mui/material/Badge";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import MoreIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useSocketContext } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { Button, Tooltip, Typography } from "@mui/material";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

interface MiniDrawerProps {
  children?: any;
}

export default function MiniDrawer(props: MiniDrawerProps) {
  const theme = useTheme();
  const { currentUser, isLoggedIn, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const { socket } = useSocketContext();
  const [open, setOpen] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const Login = () => {
    setAnchorEl(null);
    history.push("/login");
  };

  const Logout = () => {
    logout();
    setAnchorEl(null);
    history.push("/");
  };

  const UpdateProfile = () => {
    setAnchorEl(null);
    history.push("/update-profile");
  };
  const Home = () => {
    history.push("/");
  };

  const FindMatch = () => {
    if (location.pathname === "/online") history.go(0);
    else history.push("/online");
  };

  const Friends = () => null;

  const Stats = () => {
    history.push("/stats");
  };

  const Inbox = () => {
    history.push("/inbox");
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    null;
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} onClick={() => history.push("/")}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <img
                src={"typeoLogo.png"}
                width="172px"
                height="50px"
                style={{ marginTop: "7px" }}
              />
              <Typography display="inline" color="secondary">
                BETA
              </Typography>
            </Link>
          </Box>
          <Typography mx={1}>
            {isLoggedIn && currentUser.displayName
              ? currentUser.displayName!.substring(0, 15)
              : `Guest_${currentUser.uid.substring(0, 6)}`}
          </Typography>
          <IconButton
            onClick={handleMenu}
            color="secondary"
            sx={{ mr: 3, ml: 1 }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {isLoggedIn ? (
              <>
                <MenuItem onClick={UpdateProfile} sx={{ minWidth: 50, m: 0.2 }}>
                  UpdateProfile
                </MenuItem>
                <MenuItem onClick={Logout} sx={{ minWidth: 50, m: 0.2 }}>
                  Logout
                </MenuItem>
              </>
            ) : (
              <MenuItem onClick={Login} sx={{ minWidth: 150, m: 0.2 }}>
                Login
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {[
            { name: "Home", icon: <HomeIcon />, click: Home },
            { name: "Find Match", icon: <KeyboardIcon />, click: FindMatch },
            { name: "Friends", icon: <PeopleIcon />, click: Friends },
            { name: "Stats", icon: <BarChartIcon />, click: Stats },
            { name: "Inbox", icon: <MailIcon />, click: Inbox },
          ].map((val, index) => (
            <Tooltip title={val.name} key={val.name} placement="right">
              <ListItem
                disabled={["Friends", "Inbox"].includes(val.name)}
                button
                onClick={val.click}
              >
                <ListItemIcon>{val.icon}</ListItemIcon>
                <ListItemText primary={val.name} />
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Divider />
        <List>
          <Tooltip title={isLoggedIn ? "Logout" : "Login"} placement="right">
            <ListItem button onClick={isLoggedIn ? Logout : Login}>
              <ListItemIcon>
                {isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
              </ListItemIcon>
              <ListItemText primary={isLoggedIn ? "Logout" : "Login"} />
            </ListItem>
          </Tooltip>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {props.children}
      </Box>
    </Box>
  );
}
