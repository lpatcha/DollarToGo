import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Typography, Box, IconButton } from '@mui/material';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment: string) => void;
  title?: string;
  subtitle?: string;
  submitText?: string;
  isLoading?: boolean;
  showCloseOption?: boolean;
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Submit a Rating",
  subtitle = "How was your experience?",
  submitText = "Submit & Complete",
  isLoading = false,
  showCloseOption = false
}: RatingModalProps) {
  const [score, setScore] = useState<number | null>(5);
  const [comment, setComment] = useState('');

  // Reset internal state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScore(5);
      setComment('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (score) {
      onSubmit(score, comment);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={(event, reason) => {
        if (!showCloseOption && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
          return;
        }
        onClose();
      }}
      disableEscapeKeyDown={!showCloseOption}
      PaperProps={{ style: { borderRadius: 24, padding: '8px' } }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle className="font-extrabold text-[20px] text-text-main text-center pb-2 relative">
        {title}
        {showCloseOption && (
          <IconButton 
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 4 }}
            size="small"
          >
            <X className="w-5 h-5 text-slate-400" />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" className="text-text-muted text-center mb-6">
          {subtitle}
        </Typography>
        
        <Box display="flex" justifyContent="center" mb={4}>
          <Rating
            name="shared-rating"
            value={score}
            onChange={(event, newValue) => setScore(newValue)}
            size="large"
            icon={<Star className="w-8 h-8 fill-amber-400 text-amber-400" />}
            emptyIcon={<Star className="w-8 h-8 text-slate-200" />}
          />
        </Box>

        <TextField
          label="Leave a comment (Optional)"
          multiline
          rows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '14px',
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-primary)',
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--color-primary)'
            }
          }}
        />
      </DialogContent>
      
      <DialogActions className="px-6 pb-6 pt-0 flex space-x-3">
        {showCloseOption && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-12 rounded-[12px] font-bold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={!score || isLoading}
          className="flex-1 h-12 rounded-[12px] font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? 'Saving...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
