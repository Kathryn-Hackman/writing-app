import './App.css'
import { SimpleEditor } from './components/tiptap-templates/simple/simple-editor'

function App() {
  const dateOptions = { weekday: "long"} as const;
  const currentDate = new Date().toLocaleDateString('en-us', dateOptions);
  return (
    <>
      <h4>{currentDate}</h4>
      <h2>Hello, I'm the prompt</h2>
      <SimpleEditor></SimpleEditor>
    </>
  )
}

export default App
