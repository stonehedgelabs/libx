import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { Action } from '../store';

function useDownload() {
  const dispatch = useDispatch();

  const downloadFile = useCallback(
    async (accessToken: string, provider: 'spotify' | 'apple' = 'spotify') => {
      const url = new URL(
        provider === 'spotify'
          ? import.meta.env.VITE_SPOTIFY_REDIRECT_URI
          : import.meta.env.VITE_APPLE_REDIRECT_URI
      );

      if (!accessToken) return;
      dispatch({
        type: Action.SET_DOWNLOAD_LOADING,
        payload: true,
      });

      dispatch({
        type: Action.SET_DOWNLOAD_ERROR,
        payload: null,
      });

      const filename = `libx-${provider}-export-${v4()}.csv`;
      const endpoint = provider === 'spotify' ? 'spotify' : 'apple';

      try {
        const response = await fetch(
          `https://${url.host}/api/${endpoint}/download/${filename}?t=${accessToken}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'text/csv',
              Connection: 'keep-alive',
            },
          }
        );

        if (!response.ok) {
          dispatch({
            type: Action.SET_DOWNLOAD_ERROR,
            payload: new Error(
              `Failed to download file: (${response.status}) ${response.statusText}`
            ),
          });
          return;
        }

        const blob = await response.blob();
        const uri = window.URL.createObjectURL(blob);

        dispatch({
          type: Action.SET_DOWNLOAD_URI,
          payload: uri,
        });
        const link = document.createElement('a');
        link.href = uri;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(uri);
      } catch (e: any) {
        dispatch({
          type: Action.SET_DOWNLOAD_ERROR,
          payload: `Failed to download file: ${e.toString()}`,
        });
      } finally {
        dispatch({
          type: Action.SET_DOWNLOAD_LOADING,
          payload: false,
        });

        setTimeout(() => {
          window.location.href = '/';
        }, 10000);
      }
    },
    [dispatch]
  );

  return {
    downloadFile,
  };
}

export { useDownload };
