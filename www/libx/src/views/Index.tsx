import { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, Spinner } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { State, Action } from '../store';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';
import SpotifyIcon from '../components/icons/SpotifyIcon';
import AppleIcon from '../components/icons/AppleIcon';
import MusicTapeIcon from '../components/icons/MusicTapeIcon';
import { useDownload } from '../services/Download';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI;

const SPOTIFY_SCOPES = ['playlist-read-private', 'user-library-read'];
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${SPOTIFY_SCOPES.join('%20')}`;

const APPLE_AUTH_URL = `https://appleid.apple.com/auth/authorize?response_type=code&client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(APPLE_REDIRECT_URI)}&scope=name%20email&response_mode=form_post`;

function Index() {
  const dispatch = useDispatch();
  const { downloadFile } = useDownload();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [provider, setProvider] = useState<'spotify' | 'apple' | null>(null);

  const subtitle = useSelector((state: State) => state.content.subtitle);
  const loading = useSelector((state: State) => state.download.loading);
  const error = useSelector((state: State) => state.download.error);
  const downloadURI = useSelector((state: State) => state.download.downloadURI);

  const onSpotifyClick = () => {
    if (!accessToken || provider !== 'spotify') {
      window.location.href = SPOTIFY_AUTH_URL;
    }
    if (accessToken && provider === 'spotify') {
      return downloadFile(accessToken, 'spotify');
    }
  };

  const onAppleClick = () => {
    if (!accessToken || provider !== 'apple') {
      window.location.href = APPLE_AUTH_URL;
    }
    if (accessToken && provider === 'apple') {
      return downloadFile(accessToken, 'apple');
    }
  };

  useEffect(() => {
    // Check for tokens in query params (from backend callback)
    const queryParams = new URLSearchParams(window.location.search);
    const spotifyToken = queryParams.get('spotify_token');
    const appleToken = queryParams.get('apple_token');

    if (spotifyToken) {
      setAccessToken(spotifyToken);
      setProvider('spotify');
    }

    if (appleToken) {
      setAccessToken(appleToken);
      setProvider('apple');
    }
  }, []);

  const getBtnTitle = (btnProvider: 'spotify' | 'apple') => {
    if (accessToken && provider === btnProvider) {
      return 'Download';
    }
    return btnProvider === 'spotify'
      ? 'Login with Spotify'
      : 'Login with Apple';
  };

  useEffect(() => {
    dispatch({
      type: Action.SET_CONTENT_SUBTITLE,
      payload: 'Download your music library.',
    });
  }, [dispatch]);

  useEffect(() => {
    if (loading) {
      toast('Downloading your library.', {
        autoClose: 10000,
      });
    }

    if (downloadURI) {
      toast('Download finished!', {
        autoClose: 10000,
      });
    }

    if (error) {
      toast.error(`Failed to download library.`);
    }
  }, [loading, downloadURI, error]);

  return (
    <BackgroundImg mediaURL="/assets/img/bg.gif">
      <Content>
        <Flex w="80%" flexDirection="column" alignItems="center">
          <MusicTapeIcon height="3em" width="3em" />
          <Text textAlign="center" mb={4} mt={2}>
            {subtitle}
          </Text>
        </Flex>
        <Flex
          flexDirection={['column']}
          w={'80%'}
          alignItems={'center'}
          gap={3}
        >
          {/* Spotify Button */}
          <Flex flexDirection="column" alignItems="center" w={'100%'}>
            <Button
              onClick={onSpotifyClick}
              background="linear-gradient(90deg, #000000 0%, #1DB954 100%)"
              color="white"
              rounded={'xl'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              h={50}
              w={[150, '100%']}
              _hover={{ opacity: 0.9 }}
            >
              {loading && provider === 'spotify' && <Spinner />}
              {!(loading && provider === 'spotify') && (
                <>
                  <SpotifyIcon />
                  <Text>{getBtnTitle('spotify')}</Text>
                </>
              )}
            </Button>
          </Flex>

          {/* Apple Button */}
          <Flex flexDirection="column" alignItems="center" w={'100%'}>
            <Button
              onClick={onAppleClick}
              background="linear-gradient(90deg, #D01030 0%, #FB5C74 100%)"
              color="white"
              rounded={'xl'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              h={50}
              w={[150, '100%']}
              _hover={{ opacity: 0.9 }}
            >
              {loading && provider === 'apple' && <Spinner />}
              {!(loading && provider === 'apple') && (
                <>
                  <AppleIcon />
                  <Text>{getBtnTitle('apple')}</Text>
                </>
              )}
            </Button>
          </Flex>
          <Flex
            gap={2}
            flexDirection="row"
            w="100%"
            justifyContent="center"
            mt={4}
          >
            <Box>
              {/* <Link href="https://www.buymeacoffee.com/rashad.wiki">
                <Image
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=rashad.wiki&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                  alt="Buy me a coffee"
                  w={['150', '150']}
                  _hover={{ opacity: 0.7 }}
                />
              </Link> */}
            </Box>
          </Flex>
        </Flex>
      </Content>
    </BackgroundImg>
  );
}

export default Index;
