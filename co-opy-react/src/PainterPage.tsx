import { ReactSketchCanvas } from 'react-sketch-canvas';
import type { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useState, useRef } from 'react';
import './PainterPage.css'

export function PainterPage() {
    const [brushColor, setBrushColor] = useState('red');
    const [brushWidth, setBrushWidth] = useState(4);

    const handleUndo = () => canvasRef.current?.undo();
    const handleRedo = () => canvasRef.current?.redo();

    const canvasRef = useRef<ReactSketchCanvasRef>(null);

    return (
        <div>
            <ReactSketchCanvas
                width='500px'
                height='500px'
                strokeColor={brushColor}
                strokeWidth={brushWidth}
                ref={canvasRef} />

            <div className='colors'>
                <button id='redColor' 
                    onClick={() => setBrushColor('red')}></button>
                <button id='orangeColor' 
                    onClick={() => setBrushColor('orange')}></button>
                <button id='yellowColor' 
                    onClick={() => setBrushColor('yellow')}></button>
                <button id='greenColor' 
                    onClick={() => setBrushColor('green')}></button>
                <button id='skyblueColor' 
                    onClick={() => setBrushColor('skyblue')}></button>
                <button id='blueColor' 
                    onClick={() => setBrushColor('blue')}></button>
                <button id='purpleColor' 
                    onClick={() => setBrushColor('purple')}></button>
                <button id='brownColor' 
                    onClick={() => setBrushColor('brown')}></button>
                <button id='blackColor' 
                    onClick={() => setBrushColor('black')}></button>
                <button id='whiteColor' 
                    onClick={() => setBrushColor('white')}></button>
            </div>

            <input type='range'
                   min={1}
                   max={20}
                   value={brushWidth}
                   onChange={(e) => setBrushWidth(parseInt(e.target.value))} />
            
            <button onClick={handleUndo}>Undo</button>
            <button onClick={handleRedo}>Redo</button>
        </div>
    )
}