import React, { useState, useEffect} from 'react';
import type {ChangeEvent} from 'react';
import styles from './userSearchPage.module.css';

// Define la estructura de un usuario (puedes expandirla según tus necesidades)
interface User {
  id: number;
  name: string;
  // email?: string;
  // role?: string;
}

// Datos de ejemplo iniciales (eventualmente los obtendrás de tu backend)
const mockUsers: User[] = [
  { id: 1, name: 'Albacete Fernández, Ana' },
  { id: 2, name: 'Alicante Torres, Luis' },
  { id: 3, name: 'Almería Giménez, Carmen' },
  { id: 4, name: 'Ávila Ruiz, Pedro' },
  { id: 5, name: 'Badajoz Soler, María' },
  { id: 6, name: 'Barcelona Navarro, Javier' },
  { id: 7, name: 'Bilbao Castro, Sofía' },
];

const UserSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(mockUsers);
    } else {
      const results = mockUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(results);
    }
  }, [searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className={styles.userSearchPageContainer}>
      <div className={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20px"
            height="20px"
          >
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        </span>
      </div>

      <div className={styles.userListContainer}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div key={user.id} className={styles.userListItem}>
              {user.name}
            </div>
          ))
        ) : (
          <div className={styles.noResultsItem}>No se encontraron usuarios.</div>
        )}
      </div>
    </div>
  );
};

export default UserSearchPage;