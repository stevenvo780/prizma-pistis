import React, { useEffect } from 'react';
import {
  Topbar,
  Nav,
  NavItem,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from 'prizma-ui';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
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
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi2';
import { TbArrowsExchange } from 'react-icons/tb';
import useUser from '@store/user';
import styles from '@styles/Header.module.css';
import { startTour } from './Tutorial';

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
    <Topbar className={styles.navbar}>
      <Link href="/home" className={styles.brand}>
        <Image
          src="/img/prizma-symbol.svg"
          alt="Prizma"
          width={36}
          height={36}
          className={styles.logo}
          fetchPriority="high"
        />
        <span className={styles.brandName}>Pistis</span>
        <span className={styles.brandUmbrella}>by Prizma</span>
      </Link>

      <Nav className={styles.navLinks}>
        <NavItem
          href="/dashboard"
          data-tour="nav-dashboard"
          active={isActive('/dashboard')}
          icon={<HiOutlineChartBarSquare size={19} />}
          className={`${styles.navItem} ${isActive('/dashboard') ? styles.navItemActive : ''}`}
        >
          <span>Dashboard</span>
        </NavItem>

        <NavItem
          href="/pistis"
          data-tour="nav-pistis"
          active={isActive('/pistis') || isActive('/fiar')}
          icon={<HiOutlineBolt size={19} />}
          className={`${styles.navItem} ${(isActive('/pistis') || isActive('/fiar')) ? styles.navItemActive : ''}`}
          style={(isActive('/pistis') || isActive('/fiar')) ? {} : { color: '#FFC313', fontWeight: 700 }}
        >
          <span>Pistis rapido</span>
        </NavItem>

        <NavItem
          href="/transacciones"
          data-tour="nav-transacciones"
          active={isActive('/transacciones')}
          icon={<TbArrowsExchange size={19} />}
          className={`${styles.navItem} ${isActive('/transacciones') ? styles.navItemActive : ''}`}
        >
          <span>Transacciones</span>
        </NavItem>

        <NavItem
          href="/client"
          data-tour="nav-clientes"
          active={isActive('/client')}
          icon={<HiOutlineUserGroup size={19} />}
          className={`${styles.navItem} ${isActive('/client') ? styles.navItemActive : ''}`}
        >
          <span>Clientes</span>
        </NavItem>

        <NavItem
          href="/plans"
          data-tour="nav-planes"
          active={isActive('/plans')}
          icon={<HiOutlineCreditCard size={19} />}
          className={`${styles.navItem} ${isActive('/plans') ? styles.navItemActive : ''}`}
        >
          <span>Planes</span>
        </NavItem>

        <DropdownMenu
          align="end"
          trigger={
            <button type="button" className={styles.avatarBtn} aria-label="Menú de usuario">
              <HiOutlineUserCircle size={26} />
            </button>
          }
          className={styles.userMenu}
        >
          <DropdownItem
            icon={<HiOutlineEnvelope size={17} />}
            onSelect={() => router.push('/contact')}
            className={styles.dropItem}
          >
            Contáctanos
          </DropdownItem>
          <DropdownItem
            icon={<HiOutlinePencilSquare size={17} />}
            onSelect={() => router.push('/edit_user')}
            className={styles.dropItem}
          >
            Editar perfil
          </DropdownItem>
          <DropdownItem
            icon={<HiOutlineQuestionMarkCircle size={17} />}
            onSelect={startTour}
            className={styles.dropItem}
          >
            Ver tour de la app
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            icon={<HiOutlineArrowRightOnRectangle size={17} />}
            onSelect={() => logout()}
            danger
            className={`${styles.dropItem} ${styles.dropItemDanger}`}
          >
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Nav>
    </Topbar>
  );
};

export default Header;
