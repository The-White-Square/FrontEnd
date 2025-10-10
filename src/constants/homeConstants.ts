/**
 * Home Page Constants
 * 
 * Constants used throughout the home page and modal system.
 * These values control modal behavior and animations.
 */

/**
 * Types of modals that can be opened on the home page
 * - null: No modal open
 * - 'create': Create new room modal
 * - 'join': Join existing room modal  
 * - 'choose': Choose avatar modal
 */
export type ModalType = null | 'create' | 'join' | 'choose';

/**
 * Duration for modal open/close animations in milliseconds
 * Used for fade in/out and scale up/down effects
 */
export const MODAL_ANIMATION_DURATION = 300;