import { Button } from '../components/Button.jsx';
import { Frame } from './Frame.jsx';

export default {
  title: 'Base/Button',
  component: Button,
};

export const Primary = () => (
  <Frame title="Button">
    <Button>Основна</Button>
  </Frame>
);

export const Variants = () => (
  <Frame title="Button variants">
    <div style={{ display: 'flex', gap: 8 }}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="secondary" active>Active</Button>
      <Button disabled>Disabled</Button>
    </div>
  </Frame>
);
