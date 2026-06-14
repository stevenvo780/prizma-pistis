import React, { useEffect } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCreditCard,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePencilSquare,
  HiOutlineEnvelope,
  HiOutlineUserCircle,
  HiOutlineChartBarSquare,
  HiOutlineBolt,
} from 'react-icons/hi2';
import { TbArrowsExchange } from 'react-icons/tb';
import useUser from '@store/user';
import styles from '@styles/Header.module.css';
import { startTour } from './Tutorial';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

const Header = () => {
  const router = useRouter();
  const { fetchUser, user, logout, token } = useUser();

  useEffect(() => {
    if (!user && token) {
      fetchUser();
    }
  }, [user, token]);

  const isActive = (path: string) => router.pathname === path;

  return (
    <Navbar expand="lg" className={styles.navbar}>
      <Navbar.Brand href="/home" className={styles.brand}>
        <Image
          src="/img/cauce-symbol.svg"
          alt="Olympo"
          width={36}
          height={36}
          className={styles.logo}
          fetchPriority="high"
        />
        <span className={styles.brandName}>Fiar</span>
        <span className={styles.brandUmbrella}>by Olympo</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="main-nav" className={styles.toggler} />
      <Navbar.Collapse id="main-nav" className="justify-content-end">
        <Nav className={styles.navLinks}>
          <Nav.Link
            href="/dashboard"
            data-tour="nav-dashboard"
            className={`${styles.navItem} ${isActive('/dashboard') ? styles.navItemActive : ''}`}
          >
            <HiOutlineChartBarSquare size={19} />
            <span>Dashboard</span>
          </Nav.Link>
          <Nav.Link
            href="/fiar"
            data-tour="nav-fiar"
            className={`${styles.navItem} ${isActive('/fiar') ? styles.navItemActive : ''}`}
            style={isActive('/fiar') ? {} : { color: '#FFC313', fontWeight: 700 }}
          >
            <HiOutlineBolt size={19} />
            <span>Fiar rapido</span>
          </Nav.Link>
          <Nav.Link
            href="/transacciones"
            data-tour="nav-transacciones"
            className={`${styles.navItem} ${isActive('/transacciones') ? styles.navItemActive : ''}`}
          >
            <TbArrowsExchange size={19} />
            <span>Transacciones</span>
          </Nav.Link>
          <Nav.Link
            href="/client"
            data-tour="nav-clientes"
            className={`${styles.navItem} ${isActive('/client') ? styles.navItemActive : ''}`}
          >
            <HiOutlineUserGroup size={19} />
            <span>Clientes</span>
          </Nav.Link>
          <Nav.Link
            href="/plans"
            data-tour="nav-planes"
            className={`${styles.navItem} ${isActive('/plans') ? styles.navItemActive : ''}`}
          >
            <HiOutlineCreditCard size={19} />
            <span>Planes</span>
          </Nav.Link>

          <NavDropdown
            title={
              <span className={styles.avatarBtn}>
                <HiOutlineUserCircle size={26} />
              </span>
            }
            id="user-menu"
            align={{ lg: 'end' }}
            drop="down"
            className={styles.userMenu}
          >
            <NavDropdown.Item href="/contact" className={styles.dropItem}>
              <HiOutlineEnvelope size={17} />
              <span>Contáctanos</span>
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => router.push('/edit_user')} className={styles.dropItem}>
              <HiOutlinePencilSquare size={17} />
              <span>Editar perfil</span>
            </NavDropdown.Item>
            <NavDropdown.Item onClick={startTour} className={styles.dropItem}>
              <HiOutlineQuestionMarkCircle size={17} />
              <span>Ver tour de la app</span>
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => logout()} className={`${styles.dropItem} ${styles.dropItemDanger}`}>
              <HiOutlineArrowRightOnRectangle size={17} />
              <span>Cerrar sesión</span>
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
