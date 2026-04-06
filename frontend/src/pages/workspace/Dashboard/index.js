/**
 * Dashboard Components - Index File
 * 
 * Simple re-exports for cleaner imports:
 * 
 * Instead of:
 *   import Dashboard from '../pages/workspace/Dashboard/Dashboard'
 *   import StatCards from '../pages/workspace/Dashboard/StatCards'
 *   import ActivityCharts from '../pages/workspace/Dashboard/ActivityCharts'
 *   import AlertWidgets from '../pages/workspace/Dashboard/AlertWidgets'
 * 
 * Use:
 *   import Dashboard, { StatCards, ActivityCharts, AlertWidgets } from '../pages/workspace/Dashboard'
 */

export { default as StatCards } from './StatCards';
export { default as ActivityCharts } from './ActivityCharts';
export { default as AlertWidgets } from './AlertWidgets';
export { default } from './Dashboard';
