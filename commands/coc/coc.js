import clashApi from 'clash-of-clans-api';
import dotenv from 'dotenv';

dotenv.config();
const client = clashApi({
  token: process.env.COCTOKEN // Optional, can also use COC_API_TOKEN env variable
});

export const MyClan = await client.clanByTag('#2P8LRLVVR');
