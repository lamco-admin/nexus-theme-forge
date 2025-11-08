import React from 'react';
import { UserRole } from './DashboardGrid';
import { Button } from './ui/button';
import { User, Shield, Crown } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
    { value: 'agent', label: 'Agent', icon: <User className="h-4 w-4" /> },
    { value: 'supervisor', label: 'Supervisor', icon: <Shield className="h-4 w-4" /> },
    { value: 'admin', label: 'Admin', icon: <Crown className="h-4 w-4" /> },
  ];

  return (
    <div className="flex gap-2">
      {roles.map((role) => (
        <Button
          key={role.value}
          variant={currentRole === role.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onRoleChange(role.value)}
          className="gap-2"
        >
          {role.icon}
          {role.label}
        </Button>
      ))}
    </div>
  );
};
