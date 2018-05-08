{-# LANGUAGE TupleSections #-}
{-# LANGUAGE DataKinds       #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE TypeOperators   #-}
{-# LANGUAGE ScopedTypeVariables   #-}

module Lib (startApp) where

import Data.Aeson
import Data.Aeson.TH
import Network.Wai
import Network.Wai.Handler.Warp
import Servant
import System.Random
import Data.List (intercalate)
import NumberTheory (exponentiate, roots)
import Data.Numbers.Primes (primes, isPrime)
import Data.Maybe
import Control.Monad.IO.Class
import System.IO.Unsafe
import Data.IORef

hardAB = 10
hardP = 3

data Storage = Storage
  { p :: Integer
  , g :: Integer
  , a :: Integer
  , a0 :: Integer
  , b :: Integer
  , k :: Integer }

emptyStorage = Storage 0 0 0 0 0 0

storage :: IORef Storage
storage = unsafePerformIO $ newIORef emptyStorage

type API =
       "static" :> Raw
  :<|> "generatePG"
    :> Get '[JSON] ()  
  :<|> "sayPG"
    :> Capture "p" Integer
    :> Capture "g" Integer
    :> Get '[JSON] ()
  :<|> "askPG"
    :> Get '[JSON] String
  :<|> "sayB"
    :> Capture "b" Integer
    :> Get '[JSON] ()
  :<|> "generateA"
    :> Get '[JSON] ()
  :<|> "askA"
    :> Get '[JSON] Integer
  :<|> "askK"
    :> Get '[JSON] Integer

startApp :: IO ()
startApp = run 8080 app
  where app = serve (Proxy :: Proxy API) server

server :: Server API
server =
       serveDirectoryFileServer "./static"
  :<|> generatePG
  :<|> sayPG
  :<|> askPG
  :<|> sayB
  :<|> generateA
  :<|> askA
  :<|> askK
  where
    generatePG = liftIO $ do
      p <- getP
      let g = head $ roots p
      sayPG p g
    sayPG p g = liftIO $ modifyIORef storage (\s -> s {p=p, g=g})
    askPG = liftIO $ do
      s@Storage{g=g,p=p} <- readIORef storage
      return $ show p ++ "," ++ show g
    sayB b = liftIO $ modifyIORef storage (\s -> s {b=b})
    generateA = liftIO $ do      
      a0 <- randomRIO (10^(hardAB-1), 10^hardAB)
      s@Storage{p=p,g=g} <- readIORef storage
      let a = exponentiate g a0 p      
      let s' = s {p = p, g = g, a = a, a0=a0}
      writeIORef storage s'
    askA = liftIO (a <$> readIORef storage)      
    askK = liftIO $ do
      s@Storage{p=p,a0=a0,b=b} <- readIORef storage
      let k = exponentiate b a0 p
      writeIORef storage s{k=k} 
      return k
    
getP :: IO Integer
getP = do
  p :: Integer <- (primes !!) <$> randomRIO (10^(hardP-1), 10^hardP)
  if isPrime ((p-1) `div` 2)
  then return p
  else getP

      
  
