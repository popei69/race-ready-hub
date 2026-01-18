import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
}

export function Header({ title, showBack = false, backTo, actions }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-14 sm:h-16 gap-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="tap-target -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {title && (
            <h1 className="font-display text-lg sm:text-xl font-semibold truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>
    </header>
  );
}
