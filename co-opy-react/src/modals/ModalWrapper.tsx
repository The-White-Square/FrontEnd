type Props = {
  children: React.ReactNode
  closing: boolean
  onClose: () => void
}

function ModalWrapper({ children, closing, onClose }: Props) {
    return (
        <>
            <div className={`overlay ${closing ? 'fadeOut' : 'fadeIn'}`}
                 onClick={onClose}>
            </div>

            <div className={`modal ${closing ? 'scaleDown' : 'scaleUp'}`}>
                <button className='close-btn' onClick={onClose}>×</button>
                {children}
            </div>
        </>
    )
}

export default ModalWrapper