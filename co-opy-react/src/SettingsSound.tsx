import settings from './assets/settings.png';
import sound from './assets/sound.png';

function SettingsSound() {
    return (
        <div className='settings-sound'>
            <button>
                <img src={settings} alt="settings" width="30" height="30" />
            </button>

            <br />
            
            <button>
                <img src={sound} alt="sound" width="30" height="30" />
            </button>
        </div>
    )
}

export default SettingsSound