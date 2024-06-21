import { createComponent } from '@state-utils/containers';
import { createActionSources } from '@state-utils/actions';

export const actionSourcesComponent = createComponent(() => {
  return createActionSources();
});
