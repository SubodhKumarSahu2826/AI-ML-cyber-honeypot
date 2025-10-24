import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface AttackPoint {
  id: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  country: string;
  attacks: number;
}

export function AttackMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [attackPoints] = useState<AttackPoint[]>([
    { id: '1', lat: 39.9042, lng: 116.4074, severity: 'high', country: 'China', attacks: 247 },
    { id: '2', lat: 55.7558, lng: 37.6176, severity: 'critical', country: 'Russia', attacks: 189 },
    { id: '3', lat: 40.7128, lng: -74.0060, severity: 'medium', country: 'USA', attacks: 156 },
    { id: '4', lat: 52.5200, lng: 13.4050, severity: 'low', country: 'Germany', attacks: 89 },
    { id: '5', lat: 35.6762, lng: 139.6503, severity: 'medium', country: 'Japan', attacks: 134 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw world map outline (simplified)
      ctx.strokeStyle = 'hsl(195 100% 20%)';
      ctx.lineWidth = 1;
      ctx.fillStyle = 'hsl(220 20% 8%)';
      
      // Simple world map representation
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = 'hsl(195 100% 15%)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i <= canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      for (let i = 0; i <= canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw attack points
      attackPoints.forEach((point, index) => {
        const x = ((point.lng + 180) / 360) * canvas.width;
        const y = ((90 - point.lat) / 180) * canvas.height;
        
        const colors = {
          low: 'hsl(150 100% 55%)',
          medium: 'hsl(45 100% 55%)',
          high: 'hsl(15 85% 60%)',
          critical: 'hsl(0 85% 60%)'
        };
        
        const sizes = {
          low: 3,
          medium: 5,
          high: 7,
          critical: 9
        };
        
        // Pulsing effect
        const pulseSize = sizes[point.severity] + Math.sin(Date.now() / 500 + index) * 2;
        
        ctx.fillStyle = colors[point.severity];
        ctx.shadowColor = colors[point.severity];
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();
  }, [attackPoints]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-destructive/80';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full rounded-lg border border-primary/20 bg-background"
        />
        <div className="absolute top-2 right-2 text-xs text-primary font-mono">
          LIVE THREAT MAP
        </div>
      </div>
      
      {/* Attack Statistics */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Top Attack Sources</div>
        <div className="space-y-2">
          {attackPoints
            .sort((a, b) => b.attacks - a.attacks)
            .slice(0, 3)
            .map((point) => (
              <div key={point.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(point.severity)}`} />
                  <span className="text-sm">{point.country}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {point.attacks} attacks
                </Badge>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}