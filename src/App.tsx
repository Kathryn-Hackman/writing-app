import './App.css'
import { SimpleEditor } from './components/tiptap-templates/simple/simple-editor'

function App() {
  const weekday = new Date().toLocaleDateString('default', { weekday: "long" });
  const month = new Date().toLocaleDateString('default', { month: "long" });
  const day = new Date().toLocaleDateString('default', { day: "numeric" });

  return (
    <>
      <h4>{weekday + ', ' + month + ' ' + day}</h4>
      <h2>Hello, I'm the prompt</h2>
      <SimpleEditor></SimpleEditor>
    </>
  )
}

export default App
