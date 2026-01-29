import express, { Application, Request, Response, NextFunction } from 'express';
import ExtendedWrapper from './ExtendedWrapperSDk';
import { INTERNAL_SERVER_ERROR_CODE, SUCCESS_CODE, BAD_REQUEST_CODE } from './utils/constants';
import { getPositions, getOrderHistory, getUserHoldings } from './services/extendedmethods';
import dotenv from 'dotenv';
dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


const extendedBackendUrl = process.env.EXTENDED_BACKEND_URL;
if (!extendedBackendUrl) {
  throw new Error('EXTENDED_BACKEND_URL is not set');
}

const extendedClient = new ExtendedWrapper({
  baseUrl: extendedBackendUrl,
  apiKey: "",
  timeout: 30000,
  retries: 3
});


app.get('/positions', async (_req: Request, res: Response) => {
  try{
    const positions = await getPositions(extendedClient);
    if(positions.success){
      return res.status(SUCCESS_CODE).json({
        success: true,
        message: "Positions fetched successfully",
        data: positions.data
      });
    }else{
      return res.status(BAD_REQUEST_CODE).json({
        error: positions.message,
        message: positions.message
      });
    }
  }catch(err){
    console.error("Error getting positions", err);
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({
      error: "Error getting positions",
      message: err
    });
  }
});


app.get('/holdings', async (_req: Request, res: Response) => {
  try{
    const holdings = await getUserHoldings(extendedClient);
    if(holdings.success){
      return res.status(SUCCESS_CODE).json({
        success: true,
        message: "Holdings fetched successfully",
        data: holdings.data
      });
    }else{
      return res.status(BAD_REQUEST_CODE).json({
        error: holdings.message,
        message: holdings.message
      });
    }
  }catch(err){
    console.error("Error getting holdings", err);
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({
      error: "Error getting holdings",
      message: err
    });
  }
});

app.get('/fundingRates/:marketName/:side', async (_req: Request, res: Response) => {
  try{
    const marketName = _req.params.marketName as string;
    const side = _req.params.side as string;
    const now = Date.now();
    const startTime = _req.query.startTime ? Number(_req.query.startTime) : now - (2 * 24 * 60 * 60 * 1000);
    const endTime = _req.query.endTime ? Number(_req.query.endTime) : now - (1 * 24 * 60 * 60 * 1000);
    

    const fundingRates = await extendedClient.getFundingRates(marketName, side, startTime, endTime);
    return res.status(SUCCESS_CODE).json({
      success: true,
      message: "Funding rates fetched successfully",
      data: fundingRates.data
    });
  }catch(err){
    console.error("Error getting funding rates", err);
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({
      error: "Error getting funding rates",
      message: err
    });
  }
});


app.get('/marketOrders/:marketName', async (_req: Request, res: Response) => {
  try{
    const marketName = _req.params.marketName as string;
    if(!marketName){
      return res.status(BAD_REQUEST_CODE).json({
        error: "Market name is required",
        message: "Market name is required"
      });
    }
    const orderHistory = await getOrderHistory(extendedClient, marketName);
    if(orderHistory.success){
      return res.status(SUCCESS_CODE).json({
        success: true,
        message: "Order history fetched successfully",
        data: orderHistory.data
      });
    }else{
      return res.status(BAD_REQUEST_CODE).json({
        error: orderHistory.message,
        message: orderHistory.message
      });
    }
  }catch(err){
    console.error("Error getting order history", err);
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({
      error: "Error getting order history",
      message: err
    });
  }
});


app.get('/health', (_req: Request, res: Response) => {
  return res.status(SUCCESS_CODE).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  return res.status(BAD_REQUEST_CODE).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.stack);
  return res.status(INTERNAL_SERVER_ERROR_CODE).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});


