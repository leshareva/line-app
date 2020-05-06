import { AIR_CONFIG } from './config';
import Airtable from 'lean-air'

export const base = new Airtable(AIR_CONFIG);