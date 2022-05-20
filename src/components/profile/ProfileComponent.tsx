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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/system";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import { StyledTextField, SuccessAlert, ErrorAlert, GridCard } from "../common";

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

const StyledDiv = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 24,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

interface Field {
  name: string;
  label: string;
  autoComplete: string;
}

interface ProfileComponentProps {
  name: string;
  errorOpen?: boolean;
  error?: string;
  messageOpen?: boolean;
  message?: string;
  loading?: boolean;
  fields: Array<Field>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  signupLink?: boolean;
  loginLink?: boolean;
  forgotPasswordLink?: boolean;
  children?: any;
}

export default function ProfileComponent({
  name,
  errorOpen,
  error,
  messageOpen,
  message,
  loading,
  fields,
  handleSubmit,
  signupLink,
  loginLink,
  forgotPasswordLink,
  children,
}: ProfileComponentProps) {
  return (
    <Container component="main" maxWidth="sm">
      <GridCard sx={{ marginTop: 10 }}>
        <StyledDiv>
          <StyledAvatar>
            <LockOutlinedIcon />
          </StyledAvatar>
          <Typography component="h1" variant="h5">
            {name}
          </Typography>
          <Collapse in={errorOpen}>
            <ErrorAlert severity="error">{error}</ErrorAlert>
          </Collapse>
          <Collapse in={messageOpen}>
            <SuccessAlert severity="success">{message}</SuccessAlert>
          </Collapse>
          <StyledForm onSubmit={handleSubmit} noValidate>
            {fields.map((val, i) => {
              return (
                <StyledTextField
                  key={val.name}
                  margin="normal"
                  required
                  fullWidth
                  id={val.name}
                  label={val.label}
                  type={val.name}
                  name={val.name}
                  autoComplete={val.autoComplete}
                  autoFocus={i === 0}
                />
              );
            })}
            {children}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ marginTop: 1, marginBottom: 2 }}
              disabled={loading}
            >
              {name}
            </Button>
          </StyledForm>
          <Grid container>
            {forgotPasswordLink ? (
              <Grid item xs>
                <Link to="/forgot-password">
                  <MuiLink>{"Forgot password?"}</MuiLink>
                </Link>
              </Grid>
            ) : null}
            {loginLink ? (
              <Grid item xs>
                <Link to="/login">
                  <MuiLink>{"Already have an account? Login"}</MuiLink>
                </Link>
              </Grid>
            ) : null}
            {signupLink ? (
              <Grid item>
                <Link to="/signup">
                  <MuiLink>{"Don't have an account? Sign Up"}</MuiLink>
                </Link>
              </Grid>
            ) : null}
          </Grid>
        </StyledDiv>
      </GridCard>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
