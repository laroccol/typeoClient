import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { StyledTextField, ErrorAlert } from "../../common";
import Container from "@mui/material/Container";
import { useAuth } from "../../../contexts/AuthContext";
import { styled } from "@mui/system";
import ProfileComponent from "../ProfileComponent";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" to="https://material-ui.com/">
        <MuiLink>Your Website</MuiLink>
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px",
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
}));

export default function SignupComponent(props: any) {
  const { signup } = useAuth();

  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      email: { value: string };
      username: { value: string };
      password: { value: string };
      passwordConfirm: { value: string };
    };

    const email = target.email.value;
    const username = target.username.value;
    const password = target.password.value;
    const passwordConfirm = target.password.value;

    // const regex = /^[a-zA-Z0-9_.-]*$/;
    // if (!regex.test(username)) {
    //   setErrorOpen(true);
    //   setError("Invalid Username");
    //   return;
    // }

    if (password !== passwordConfirm) {
      setErrorOpen(true);
      setError("Passwords do not match");
      return;
    }

    setErrorOpen(false);
    setError("");
    setLoading(true);

    try {
      await signup(email, username, password);
      history.push("/");
    } catch (err: any) {
      setErrorOpen(true);
      setError(`${err.response?.data || err}`);
      setLoading(false);
    }
  };

  return (
    <ProfileComponent
      name="Signup"
      handleSubmit={handleSubmit}
      errorOpen={errorOpen}
      error={error}
      loading={loading}
      fields={[
        { name: "email", label: "Email Address", autoComplete: "email" },
        { name: "username", label: "Username", autoComplete: "username" },
        {
          name: "password",
          label: "Password",
          autoComplete: "current-password",
        },
        {
          name: "passwordConfirm",
          label: "Confirm Password",
          autoComplete: "",
        },
      ]}
      loginLink
    ></ProfileComponent>
  );
}
