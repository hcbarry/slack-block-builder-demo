import { allFilms } from '../view';
import { filmRepository } from '../services';

import type { ActionMw } from '../types';

export interface PaginatedAction {
  action: string;
  page?: number;
  offset?: number;
}

export const renderAllFilms: ActionMw = async ({
  action, client, ack, body,
}) => {
  const actionId: PaginatedAction = JSON.parse(action.action_id);

  await ack();

  const perPage = 3;
  const [films, totalFilms] = await Promise.all([
    filmRepository.getAllPaginated({
      skip: actionId.offset || 0,
      take: perPage,
    }),
    filmRepository.countAll(),
  ]);

  const view = allFilms({
    films,
    totalFilms,
    perPage,
    page: actionId.page || 1,
    userId: body.user.id,
  });

  if (body.view) {
    await client.views.update({ view, view_id: body.view.id });

    return;
  }

  await client.views.open({ view, trigger_id: body.trigger_id });
};
