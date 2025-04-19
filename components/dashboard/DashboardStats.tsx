import { 
    FileText, 
    Upload, 
    CheckCircle, 
    Tag 
  } from 'lucide-react';
import { JSX } from 'react';
  
  interface StatsProps {
    stats: {
      totalCVs: number;
      remainingUploads: number;
      processedCVs: number;
      totalTags: number;
    };
  }
  
  interface StatItem {
    name: string;
    value: number;
    icon: JSX.Element;
    description: string;
  }
  
  export default function DashboardStats({ stats }: StatsProps) {
    const statItems: StatItem[] = [
      {
        name: 'Total CVs',
        value: stats.totalCVs,
        icon: <FileText className="h-6 w-6 text-blue-500" />,
        description: 'CVs in your library',
      },
      {
        name: 'Remaining Uploads',
        value: stats.remainingUploads,
        icon: <Upload className="h-6 w-6 text-green-500" />,
        description: 'Uploads available this month',
      },
      {
        name: 'Processed CVs',
        value: stats.processedCVs,
        icon: <CheckCircle className="h-6 w-6 text-purple-500" />,
        description: 'Successfully processed',
      },
      {
        name: 'Total Tags',
        value: stats.totalTags,
        icon: <Tag className="h-6 w-6 text-orange-500" />,
        description: 'Unique tags across profiles',
      },
    ];
  
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <div 
            key={item.name} 
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }