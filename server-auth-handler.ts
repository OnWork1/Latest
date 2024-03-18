import { AppRole } from '~/enums/app-role';
import HttpStatus from '../../common/http-status.enums';
import { AuthMap, type HTTPMethod } from './server-auth-map';

export default function checkRoles(
  path: string,
  httpMethod: HTTPMethod,
  userRoles: AppRole[]
) {
  let namespace = null;
  path = cleanPath(path);

  namespace = AuthMap.find((x) => cleanPath(x.namespace) === path);

  if (!namespace) {
    namespace = AuthMap.find(
      (x) => cleanPath(x.namespace) === removeSlash(path)
    );
  }

  if (namespace) {
    const privilege = namespace.privileges.find(
      (x) => x.httpMethod === httpMethod
    );
    if (privilege) {
      if (!privilege.roles.some((role) => userRoles.includes(role))) {
        throw createError({ statusCode: HttpStatus.FORBIDDEN });
      }
    } else {
      throw createError({
        statusCode: HttpStatus.FORBIDDEN,
        statusMessage: 'Unmapped Route',
      });
    }
  } else {
    throw createError({
      statusCode: HttpStatus.FORBIDDEN,
      statusMessage: 'Unmapped Route',
    });
  }
}

//Remove /api/ from path if it exists
function cleanPath(path: string) {
  path = path.toLowerCase().trim();
  if (path.startsWith('/api/')) {
    path = path.slice(5);
  }
  return path;
}

function removeSlash(path: string) {
  if (path.includes('/')) {
    path = path.substring(0, path.indexOf('/'));
  }
  return path;
}
