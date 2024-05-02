import React, { useContext } from 'react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { Tooltip } from '@mui/material';
import { AuthContext } from '../../../contexts/auth/Auth.Context';
import useTokenFavorites from '../../hooks/token/useTokenFavorites';

const Favorites = props => {
  const { favoriteTokenIds, addTokenToFavorites, removeTokenFromFavorites } = useTokenFavorites();
  const { isAuthenticated, openLoginModal } = useContext(AuthContext);
  const id = props.data.canister_id;
  const isFavorite = (favoriteTokenIds ?? []).includes(id);
  
  const onClick = () => {
    if(isAuthenticated) {
      const index = favoriteTokenIds.indexOf(id);
      if (index !== -1) {
        // ID is already in the array, remove it
        removeTokenFromFavorites(id);
      } else {
        // ID is not in the array, add it
        addTokenToFavorites(id);
      }
    } else {
      openLoginModal();
    }
  };
  return (
    <div
      onClick={() => onClick()}
      style={{ cursor: 'pointer' }}
      className="favorite-icon inline-flex justify-center h-[60px] items-center w-[10px]"
    >
      {isFavorite ? (
        <Tooltip title="Remove from Watchlist">
          <StarIcon color="secondary" className="favorite-icon" style={{ fontSize: '16px' }} />
        </Tooltip>
      ) : (
        <Tooltip title="Add to Watchlist">
          <StarBorderIcon color="lightGray" className="favorite-icon" style={{ fontSize: '16px' }} />
        </Tooltip>
      )}
    </div>
  );
};
export default Favorites;
