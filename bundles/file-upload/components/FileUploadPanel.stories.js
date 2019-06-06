import React from 'react';
import { storiesOf } from '@storybook/react';
import { FileUploadPanel } from './FileUploadPanel';

storiesOf('FileUploadPanel', module)
  .add('basic', () => (
    <FileUploadPanel />
  ))