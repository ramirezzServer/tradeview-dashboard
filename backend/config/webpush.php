<?php

return [
    'vapid' => [
        'subject'    => env('WEBPUSH_VAPID_SUBJECT', env('VAPID_SUBJECT', 'mailto:admin@legistock.com')),
        'public_key' => env('WEBPUSH_VAPID_PUBLIC_KEY', env('VAPID_PUBLIC_KEY')),
        'private_key'=> env('WEBPUSH_VAPID_PRIVATE_KEY', env('VAPID_PRIVATE_KEY')),
    ],
];
