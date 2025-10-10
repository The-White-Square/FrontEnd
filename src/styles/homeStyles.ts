// Responsive CSS styles for the Home component
export const homeStyles = `
  .pattern-bg-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 95vw;
    max-width: 1850px;
    height: 90vh;
    max-height: 920px;
    transform: translate(-50%, -50%);
    border-radius: 48px;
    overflow: hidden;
    box-shadow: 0 8px 48px 0 #0000009a;
  }
  
  .floating-icons {
    position: absolute;
    top: 2.5%;
    left: 2.5%;
  }
  
  @media (max-width: 1200px) {
    /* Better font sizing for medium/average screens */
    button {
      font-size: 18px !important;
      min-height: 52px !important;
    }
  }

  @media (max-width: 900px) {
    .pattern-bg-container {
      width: 92vw !important;
      max-width: 92vw !important;
      height: 85vh !important;
      max-height: 85vh !important;
      border-radius: 24px !important;
    }
    .floating-icons {
      top: 4% !important;
      left: 4% !important;
    }
    /* Font sizing for smaller medium screens */
    button {
      font-size: 19px !important;
      min-height: 50px !important;
    }
  }
  
  @media (max-width: 700px) {
    .pattern-bg-container {
      width: 90vw !important;
      max-width: 90vw !important;
      height: 80vh !important;
      max-height: 80vh !important;
      border-radius: 16px !important;
    }
    .floating-icons {
      top: 5% !important;
      left: 5% !important;
    }
    /* Better button font sizing for tablets */
    button {
      font-size: 20px !important;
      min-height: 48px !important;
    }
  }
  
  @media (max-width: 480px) {
    .pattern-bg-container {
      width: 88vw !important;
      max-width: 88vw !important;
      height: 75vh !important;
      max-height: 75vh !important;
      border-radius: 12px !important;
    }
    .floating-icons {
      top: 6% !important;
      left: 6% !important;
    }
    /* Larger font for mobile devices */
    button {
      font-size: 24px !important;
      min-height: 52px !important;
      padding: 14px 18px !important;
    }
  }
  
  @media (max-width: 360px) {
    .pattern-bg-container {
      width: 86vw !important;
      max-width: 86vw !important;
      height: 70vh !important;
      max-height: 70vh !important;
      border-radius: 8px !important;
    }
    /* Even larger font for very small screens */
    button {
      font-size: 26px !important;
      min-height: 56px !important;
      padding: 16px 20px !important;
    }
  }
  
  @media (min-width: 1200px) {
    .floating-icons {
      top: 48px !important;
      left: 48px !important;
    }
  }

  /* Avatar Modal Responsive Styles */
  .avatar-modal {
    min-width: 600px;
    max-width: 700px;
    min-height: 500px;
    max-height: 80vh;
    padding: 35px;
    border-radius: 25px;
  }

  .avatar-modal .title-block {
    min-width: 300px;
    max-width: 450px;
    padding: 16px 30px;
    margin-bottom: 35px;
  }

  .avatar-modal .title-block h2 {
    font-size: 32px !important;
  }

  .avatar-modal .carousel-container {
    gap: 25px;
    margin-bottom: 25px;
  }

  .avatar-modal .avatar-carousel {
    gap: 10px;
  }

  .avatar-modal .close-button {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    min-height: 30px !important;
    border-radius: 50% !important;
    font-size: 18px !important;
  }

  .avatar-modal .arrow-button {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    min-height: 42px !important;
    border-radius: 50% !important;
    font-size: 20px !important;
  }

  .avatar-modal .username-input {
    width: 300px !important;
    font-size: 18px !important;
  }

  .avatar-modal .save-button {
    font-size: 24px !important;
  }

  /* Avatar specific sizing */
  .avatar-modal .center-avatar {
    width: 160px !important;
    height: 160px !important;
  }

  .avatar-modal .side-avatar {
    width: 120px !important;
    height: 120px !important;
  }

  @media (max-width: 900px) {
    .avatar-modal {
      min-width: 450px !important;
      max-width: 500px !important;
      min-height: 500px !important;
      max-height: 75vh !important;
      padding: 25px !important;
      border-radius: 20px !important;
    }
    
    .avatar-modal .title-block {
      min-width: 250px !important;
      max-width: 350px !important;
      padding: 14px 24px !important;
      margin-bottom: 28px !important;
    }
    
    .avatar-modal .title-block h2 {
      font-size: 28px !important;
    }
    
    .avatar-modal .carousel-container {
      gap: 20px !important;
      margin-bottom: 20px !important;
    }
    
    .avatar-modal .avatar-carousel {
      gap: 8px !important;
    }
    
    .avatar-modal .close-button {
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      min-height: 28px !important;
      border-radius: 50% !important;
      font-size: 16px !important;
    }
    
    .avatar-modal .arrow-button {
      width: 38px !important;
      height: 38px !important;
      min-width: 38px !important;
      min-height: 38px !important;
      border-radius: 50% !important;
      font-size: 18px !important;
    }
    
    .avatar-modal .username-input {
      width: 260px !important;
      font-size: 17px !important;
    }
    
    .avatar-modal .save-button {
      font-size: 22px !important;
    }
    
    .avatar-modal .center-avatar {
      width: 120px !important;
      height: 120px !important;
    }
    
    .avatar-modal .side-avatar {
      width: 85px !important;
      height: 85px !important;
    }
  }

  @media (max-width: 700px) {
    .avatar-modal {
      min-width: 400px !important;
      max-width: 450px !important;
      min-height: 450px !important;
      max-height: 70vh !important;
      padding: 20px !important;
      border-radius: 18px !important;
    }
    
    .avatar-modal .title-block {
      min-width: 200px !important;
      max-width: 300px !important;
      padding: 12px 20px !important;
      margin-bottom: 24px !important;
      border-radius: 12px !important;
    }
    
    .avatar-modal .title-block h2 {
      font-size: 24px !important;
    }
    
    .avatar-modal .carousel-container {
      gap: 16px !important;
      margin-bottom: 18px !important;
    }
    
    .avatar-modal .avatar-carousel {
      gap: 6px !important;
    }
    
    .avatar-modal .close-button {
      width: 26px !important;
      height: 26px !important;
      min-width: 26px !important;
      min-height: 26px !important;
      border-radius: 50% !important;
      font-size: 14px !important;
    }
    
    .avatar-modal .arrow-button {
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      min-height: 36px !important;
      border-radius: 50% !important;
      font-size: 18px !important;
    }
    
    .avatar-modal .username-input {
      width: 240px !important;
      font-size: 16px !important;
    }
    
    .avatar-modal .save-button {
      font-size: 20px !important;
    }
    
    .avatar-modal .center-avatar {
      width: 110px !important;
      height: 110px !important;
    }
    
    .avatar-modal .side-avatar {
      width: 75px !important;
      height: 75px !important;
    }
  }

  @media (max-width: 480px) {
    .avatar-modal {
      min-width: 350px !important;
      max-width: 400px !important;
      min-height: 420px !important;
      max-height: 85vh !important;
      padding: 18px !important;
      border-radius: 15px !important;
    }
    
    .avatar-modal .title-block {
      min-width: 180px !important;
      max-width: 250px !important;
      padding: 10px 16px !important;
      margin-bottom: 20px !important;
      border-radius: 10px !important;
    }
    
    .avatar-modal .title-block h2 {
      font-size: 22px !important;
    }
    
    .avatar-modal .carousel-container {
      gap: 12px !important;
      margin-bottom: 15px !important;
    }
    
    .avatar-modal .avatar-carousel {
      gap: 5px !important;
    }
    
    .avatar-modal .close-button {
      width: 24px !important;
      height: 24px !important;
      min-width: 24px !important;
      min-height: 24px !important;
      border-radius: 50% !important;
      font-size: 14px !important;
    }
    
    .avatar-modal .arrow-button {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      border-radius: 50% !important;
      font-size: 16px !important;
    }
    
    .avatar-modal .username-input {
      width: 220px !important;
      font-size: 16px !important;
    }
    
    .avatar-modal .save-button {
      font-size: 20px !important;
    }
    
    .avatar-modal .center-avatar {
      width: 100px !important;
      height: 100px !important;
    }
    
    .avatar-modal .side-avatar {
      width: 70px !important;
      height: 70px !important;
    }
  }

  @media (max-width: 360px) {
    .avatar-modal {
      min-width: 300px !important;
      max-width: 340px !important;
      min-height: 400px !important;
      max-height: 90vh !important;
      padding: 15px !important;
      border-radius: 12px !important;
    }
    
    .avatar-modal .title-block {
      min-width: 160px !important;
      max-width: 220px !important;
      padding: 8px 12px !important;
      margin-bottom: 16px !important;
      border-radius: 8px !important;
    }
    
    .avatar-modal .title-block h2 {
      font-size: 20px !important;
    }
    
    .avatar-modal .carousel-container {
      gap: 10px !important;
      margin-bottom: 12px !important;
    }
    
    .avatar-modal .avatar-carousel {
      gap: 4px !important;
    }
    
    .avatar-modal .close-button {
      width: 22px !important;
      height: 22px !important;
      min-width: 22px !important;
      min-height: 22px !important;
      border-radius: 50% !important;
      font-size: 12px !important;
    }
    
    .avatar-modal .arrow-button {
      width: 30px !important;
      height: 30px !important;
      min-width: 30px !important;
      min-height: 30px !important;
      border-radius: 50% !important;
      font-size: 14px !important;
    }
    
    .avatar-modal .username-input {
      width: 200px !important;
      font-size: 15px !important;
    }
    
    .avatar-modal .save-button {
      font-size: 18px !important;
    }
    
    .avatar-modal .center-avatar {
      width: 90px !important;
      height: 90px !important;
    }
    
    .avatar-modal .side-avatar {
      width: 65px !important;
      height: 65px !important;
    }
  }

  /* Join Room and Create Room Modal Responsive Styles */
  .join-room-modal, .create-room-modal {
    min-width: 450px;
    max-width: 550px;
    min-height: 350px;
    padding: 35px;
    border-radius: 30px;
  }

  .join-room-modal .close-button, .create-room-modal .close-button {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    min-height: 30px !important;
    border-radius: 50% !important;
    font-size: 18px !important;
  }

  @media (max-width: 900px) {
    .join-room-modal, .create-room-modal {
      min-width: 400px !important;
      max-width: 450px !important;
      min-height: 320px !important;
      padding: 28px !important;
      border-radius: 24px !important;
    }

    .join-room-modal .close-button, .create-room-modal .close-button {
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      min-height: 28px !important;
      border-radius: 50% !important;
      font-size: 16px !important;
    }
  }

  @media (max-width: 700px) {
    .join-room-modal, .create-room-modal {
      min-width: 350px !important;
      max-width: 400px !important;
      min-height: 300px !important;
      padding: 24px !important;
      border-radius: 20px !important;
    }

    .join-room-modal .close-button, .create-room-modal .close-button {
      width: 26px !important;
      height: 26px !important;
      min-width: 26px !important;
      min-height: 26px !important;
      border-radius: 50% !important;
      font-size: 14px !important;
    }
  }

  @media (max-width: 480px) {
    .join-room-modal, .create-room-modal {
      min-width: 300px !important;
      max-width: 360px !important;
      min-height: 280px !important;
      padding: 20px !important;
      border-radius: 16px !important;
    }

    .join-room-modal .close-button, .create-room-modal .close-button {
      width: 24px !important;
      height: 24px !important;
      min-width: 24px !important;
      min-height: 24px !important;
      border-radius: 50% !important;
      font-size: 14px !important;
    }
  }

  @media (max-width: 360px) {
    .join-room-modal, .create-room-modal {
      min-width: 280px !important;
      max-width: 320px !important;
      min-height: 260px !important;
      padding: 16px !important;
      border-radius: 12px !important;
    }

    .join-room-modal .close-button, .create-room-modal .close-button {
      width: 22px !important;
      height: 22px !important;
      min-width: 22px !important;
      min-height: 22px !important;
      border-radius: 50% !important;
      font-size: 12px !important;
    }
  }
`;