import { getServerSession } from '#auth';
import { AppRole } from '~/enums/app-role';
import HttpStatus from '../common/http-status.enums';
import checkRoles from '../utils/authorization/server-auth-handler';
import { type HTTPMethod } from '../utils/authorization/server-auth-map';

export default eventHandler(async (event) => {
  const route = getRequestURL(event).pathname;
  const method = event.method;

  //swagger doc url. Ignore auth for dev only
  if (
    process.env.NODE_ENV === 'development' &&
    route.startsWith('/_nitro/swagger')
  ) {
    return;
  }
  //Ignore authentication for these routes
  if (!route.startsWith('/api/') || route.startsWith('/api/auth')) {
    return;
  }

  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  } else {
    checkRoles(route, method as HTTPMethod, session.user.roles as AppRole[]);
    event.context.auth = {
      user: session.user.email ?? 'unknown',
      roles: session.user.roles,
    };
  }
});
