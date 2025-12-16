import type { TripRequest } from '../types';
import { Calendar, MapPin, DollarSign, CheckCircle, XCircle, Clock, Train, AlertCircle } from 'lucide-react';

interface TripRequestListProps {
  requests: TripRequest[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export function TripRequestList({ requests, onUpdateStatus }: TripRequestListProps) {
  const getStatusBadge = (status: TripRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="w-4 h-4" />
            承認済み
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full">
            <XCircle className="w-4 h-4" />
            却下
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            <Clock className="w-4 h-4" />
            承認待ち
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>出張申請がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-900 mb-1">{request.employeeName}</h3>
              <p className="text-gray-600">{request.department}</p>
            </div>
            {getStatusBadge(request.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-600">出張先</p>
                <p className="text-gray-900">{request.destination}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-600">期間</p>
                <p className="text-gray-900">
                  {formatDate(request.startDate)} 〜 {formatDate(request.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-600">概算費用</p>
                <p className="text-gray-900">{formatCurrency(request.estimatedCost)}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 mb-1">出張目的</p>
            <p className="text-gray-900">{request.purpose}</p>
          </div>

          {/* 選択されたルート情報 */}
          {request.selectedRoute && (
            <div className={`mb-4 p-4 rounded-lg border ${
              request.selectedRoute.isCheapest 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Train className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">選択されたルート</span>
              </div>
              <div className="text-gray-700 mb-2">
                {request.selectedRoute.departure} → {request.selectedRoute.arrival}
                <span className="ml-4">運賃: {formatCurrency(request.selectedRoute.fare)}</span>
                <span className="ml-2 text-gray-600">所要時間: {Math.floor(request.selectedRoute.duration / 60)}時間{request.selectedRoute.duration % 60}分</span>
              </div>
              {request.selectedRoute.isCheapest ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>最も経済的なルートが選択されています</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    最安値（{formatCurrency(request.selectedRoute.cheapestFare || 0)}）より
                    {formatCurrency((request.selectedRoute.fare - (request.selectedRoute.cheapestFare || 0)))}高いルートが選択されています
                  </span>
                </div>
              )}
            </div>
          )}

          {request.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onUpdateStatus(request.id, 'approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                承認
              </button>
              <button
                onClick={() => onUpdateStatus(request.id, 'rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                却下
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}