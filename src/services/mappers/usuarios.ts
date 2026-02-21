import type { SystemUser } from '../../types';
import type { UsuarioResponse, UsuarioCreate, UsuarioUpdate } from '../../types/api';

export function usuarioResponseToSystemUser(r: UsuarioResponse): SystemUser {
  return {
    id: String(r.id),
    name: r.nome,
    username: r.username,
    password: '', // Senha nunca vem da API por segurança
    role: (r.role === 'admin' || r.role === 'viewer' ? r.role : 'viewer') as 'admin' | 'viewer',
    createdAt: new Date().toISOString(), // API não retorna, usar data atual
  };
}

export function systemUserToUsuarioCreate(
  s: Pick<SystemUser, 'name' | 'username' | 'password' | 'role'>,
  entidadeId: number
): UsuarioCreate {
  return {
    nome: s.name,
    username: s.username,
    senha: s.password,
    role: s.role,
    entidade_id: entidadeId,
    p_delete: 'N', // Default conforme API
  };
}

export function systemUserToUsuarioUpdate(
  s: Partial<Pick<SystemUser, 'name' | 'username' | 'password' | 'role'>>
): UsuarioUpdate {
  const update: UsuarioUpdate = {};
  
  if (s.name !== undefined) {
    update.nome = s.name || null;
  }
  
  if (s.username !== undefined) {
    update.username = s.username || null;
  }
  
  // Só incluir senha se foi fornecida (não vazia)
  if (s.password !== undefined && s.password !== '') {
    update.senha = s.password;
  }
  
  if (s.role !== undefined) {
    update.role = s.role || null;
  }
  
  return update;
}
