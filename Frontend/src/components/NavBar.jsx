import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import './NavBar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const programOpen = () => {
    navigate('/Programs');
    handleDrawerClose();
  };

  const notesOpen = () => {
    navigate('/Notes');
    handleDrawerClose();
  };

  const booksOpen = () => {
    navigate('/Books');
    handleDrawerClose();
  };

  return (
    <div>
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <Toolbar className="toolbar">
          <IconButton edge="start" color="inherit" aria-label="menu" className="menuButton" onClick={handleDrawerOpen}>
            <MenuIcon />
          </IconButton>
          <img src={logo} alt="TechCodeHub Logo" className="logo" />
          <Typography variant="h6" className="title">
            TechCodeHub
          </Typography>
          <div className="menuItems">
            <Button color="inherit" className="navButton" component={Link} to="/">Home</Button>
            <Button color="inherit" className="navButton" component={Link} to="/about">About</Button>
            <Button color="inherit" className="navButton" component={Link} to="/signin">Login</Button>
            <Button color="inherit" className="navButton" component={Link} to="/signup">Signup</Button>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        className="drawer"
        onClose={handleDrawerClose}
        sx={{
          width: 240,
          flexShrink: 1,
          top: '64px', // Adjust this value based on the height of your AppBar
          '& .MuiDrawer-paper': {
            backgroundColor: 'rgba(0,0,0,0.8)',
            top: '64px', // Adjust this value based on the height of your AppBar
          }
        }}
      >
        <List>
          <ListItem button component={Link} to="/" onClick={handleDrawerClose} className="drawerItem">
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={booksOpen}>
            <ListItemText primary="Books" />
          </ListItem>
          <ListItem button onClick={programOpen}>
            <ListItemText primary="Programs" />
          </ListItem>
          <ListItem button onClick={notesOpen}>
            <ListItemText primary="Notes" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
};

export default Navbar;
